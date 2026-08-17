import { SignIn } from "@clerk/clerk-react";
import { Box } from "@mui/material";
import { clerkAppearance } from "../styles/clerkAppearance.styles";
import { routesPaths } from "../../../routes/routesPaths";

const SignInPage = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <SignIn appearance={clerkAppearance} signUpUrl={routesPaths.signUp} />
    </Box>
  );
};

export default SignInPage;
