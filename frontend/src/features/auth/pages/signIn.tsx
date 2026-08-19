import { SignIn } from "@clerk/clerk-react";
import { Box } from "@mui/material";
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
      {/* Appearance is inherited from AppClerkProvider so it follows the theme. */}
      <SignIn signUpUrl={routesPaths.signUp} />
    </Box>
  );
};

export default SignInPage;
