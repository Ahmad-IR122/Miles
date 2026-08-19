import { SignUp } from "@clerk/clerk-react";
import { Box } from "@mui/material";
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
      {/* Appearance is inherited from AppClerkProvider so it follows the theme. */}
      <SignUp signInUrl={routesPaths.signIn} />
    </Box>
  );
};

export default SignUpPage;
