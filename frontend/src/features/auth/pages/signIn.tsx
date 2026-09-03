import { SignIn } from "@clerk/clerk-react";
import { Box } from "@mui/material";
import { warm } from "../../../common/theme/colors";
import { routesPaths } from "../../../routes/routesPaths";

const SignInPage = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: warm.bgPage,
        backgroundImage: warm.bgImage,
        backgroundSize: "cover",
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Appearance is inherited from AppClerkProvider so it follows the theme. */}
      <SignIn signUpUrl={routesPaths.signUp} />
    </Box>
  );
};

export default SignInPage;
