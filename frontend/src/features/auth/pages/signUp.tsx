import { SignUp } from "@clerk/clerk-react";
import { Box } from "@mui/material";
import { clerkAppearance } from "../styles/clerkAppearance.styles";
import { routesPaths } from "../../../routes/routesPaths";

const SignUpPage = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <SignUp appearance={clerkAppearance} signInUrl={routesPaths.signIn} />
    </Box>
  );
};

export default SignUpPage;
