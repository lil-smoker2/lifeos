from pydantic import BaseModel, ConfigDict, Field, field_validator


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    password: str = Field(min_length=8, max_length=128)


class PasswordResetRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    recovery_code: str = Field(min_length=32, max_length=40)
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("recovery_code")
    @classmethod
    def normalize_recovery_code(cls, value: str) -> str:
        code = value.replace("-", "").replace(" ", "").upper()
        if len(code) != 32 or any(char not in "0123456789ABCDEF" for char in code):
            raise ValueError("Enter a valid recovery code")
        return code


class LoginRequest(BaseModel):
    name: str
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    role: str

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class RegistrationResponse(TokenResponse):
    recovery_codes: list[str]
