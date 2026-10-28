from app.config import Settings


def test_clerk_secret_key_strips_trailing_placeholder_dots():
    settings = Settings(
        _env_file=None,
        CLERK_SECRET_KEY="sk_test_abc123...",
    )

    assert settings.CLERK_SECRET_KEY == "sk_test_abc123"
