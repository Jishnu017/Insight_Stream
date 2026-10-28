import { Injectable, NgZone } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { Clerk } from "@clerk/clerk-js";
import { environment } from "../../../environments/environment";

export interface AuthState {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  orgId: string | null;
  orgRole: string | null;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private clerk: Clerk | null = null;

  private authState = new BehaviorSubject<AuthState>({
    isLoaded: false,
    isSignedIn: false,
    userId: null,
    orgId: null,
    orgRole: null,
  });

  public authState$ = this.authState.asObservable();

  constructor(private ngZone: NgZone) {
    this.initClerk();
  }

  private async initClerk() {
    try {
      this.clerk = new Clerk(environment.clerkPublishableKey);
      await this.clerk.load({
        // Optional configuration options can go here
      });

      this.clerk.addListener(({ session, user, organization }) => {
        this.ngZone.run(() => {
          let orgRole = "org:member";
          if (organization && user && user.organizationMemberships) {
            const membership = user.organizationMemberships.find(
              (m: any) => m.organization.id === organization.id,
            );
            if (membership) {
              orgRole = membership.role;
            }
          }

          this.authState.next({
            isLoaded: true,
            isSignedIn: !!session,
            userId: user ? user.id : null,
            orgId: organization ? organization.id : null,
            orgRole: organization ? orgRole : null,
          });
        });
      });
    } catch (err) {
      console.error("Error loading Clerk:", err);
      this.ngZone.run(() => {
        this.authState.next({ ...this.authState.value, isLoaded: true });
      });
    }
  }

  public async getToken(): Promise<string | null> {
    if (!this.clerk || !this.clerk.session) return null;
    const organizationId = this.authState.value.orgId || undefined;
    return await this.clerk.session.getToken({
      organizationId,
      skipCache: true,
    });
  }

  public signIn() {
    if (this.clerk) {
      this.clerk.redirectToSignIn();
    }
  }

  public signUp() {
    if (this.clerk) {
      this.clerk.redirectToSignUp();
    }
  }

  public signOut() {
    if (this.clerk) {
      this.clerk.signOut();
    }
  }

  public openOrganizationProfile() {
    if (!this.clerk) return;

    if (!this.authState.value.orgId) {
      this.clerk.openCreateOrganization();
      return;
    }

    this.clerk.openOrganizationProfile();
  }
}
