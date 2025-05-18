export interface ILoginDto {
    token: string;
    user: {
        id: string | number,
        username: string,
    };
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
}