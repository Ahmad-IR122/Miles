import { SignUp } from "@clerk/clerk-react";
import { Box } from "@mui/material";
import TopNav from "../../../common/topNav/topNav";

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
      <TopNav homeLink />
      <SignUp />
    </Box>
  );
};

export default SignUpPage;
