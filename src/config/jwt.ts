export const jwt_secret = () => {
  const secret = process.env.JWT_KEY;

  if(!secret){
    throw new Error("Token not found");
  }

  return secret;
}