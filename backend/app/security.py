from fastapi import Header, HTTPException, status, Depends, Request
from typing import Optional
from clerk_backend_api.security import authenticate_request
from clerk_backend_api.security.types import AuthenticateRequestOptions
from app.config import settings

class UserIdentity:
    def __init__(self, org_id: str, org_role: str = "org:member", user_id: str = "user_default"):
        self.org_id = org_id
        self.org_role = org_role
        self.user_id = user_id


def is_admin_role(role: object) -> bool:
    normalized_role = str(role or "").strip().lower()
    return normalized_role in {"org:admin", "admin", "administrator"}

async def get_current_org(request: Request) -> UserIdentity:
    secret_key = settings.CLERK_SECRET_KEY
    
    # If the user hasn't set up the clerk secret key, we must fail strictly to ensure security
    if not secret_key or secret_key.startswith("sk_test_..."):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="CLERK_SECRET_KEY is not configured on the server."
        )

    try:
        options = AuthenticateRequestOptions(secret_key=secret_key)
        # authenticate_request will perform networkless verification if jwt_key is provided,
        # otherwise it will fetch JWKS using the secret_key.
        request_state = authenticate_request(request, options)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )

    if not request_state.is_signed_in:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing authentication token"
        )
    
    # Extract claims from the verified JWT token
    claims = request_state.payload
    
    # Active organization ID and Role (Clerk automatically includes these if the frontend passes the active org token)
    org_id = claims.get("org_id")
    org_role = claims.get("org_role", "org:member")
    user_id = claims.get("sub", "user_default")

    if not org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No active organization context found in the token. Please select an organization."
        )

    return UserIdentity(org_id=org_id, org_role=org_role, user_id=user_id)


async def require_admin_org(
    identity: UserIdentity = Depends(get_current_org)
) -> UserIdentity:
    if not is_admin_role(identity.org_role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Admin rights required. Current organization role: {identity.org_role}"
        )
    return identity
