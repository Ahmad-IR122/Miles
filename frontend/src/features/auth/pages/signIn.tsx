import { SignIn } from "@clerk/clerk-react";
import { Box } from "@mui/material";
import TopNav from "../../../common/topNav/topNav";
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
      <TopNav homeLink />
      <SignIn appearance={clerkAppearance} signUpUrl={routesPaths.signUp} />
    </Box>
  );
};

export default SignInPage;
