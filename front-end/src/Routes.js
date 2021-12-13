import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { LogInPage } from "./pages/LogInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { UserInfoPage } from "./pages/UserInfoPage";
import { VerifyEmailPage } from "./pages/verifyEmailPage";
import { PrivateRoute } from "./auth/PrivateRoute";
import { EmailVerificationPage } from "./pages/EmailVerificationPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { PasswordResetPage } from "./pages/ResetPasswordPage";
export const Routes = () => {
  return (
    <Router>
      <Switch>
        <PrivateRoute path="/" exact>
          <UserInfoPage />
        </PrivateRoute>
        <Route path="/verify-email/:verificationString">
          <EmailVerificationPage />
        </Route>
        <Route path="/reset-password/:passwordResetCode">
          <PasswordResetPage />
        </Route>
        <Route path="/login">
          <LogInPage />
        </Route>
        <Route path="/verify">
          <VerifyEmailPage />
        </Route>
        <Route path="/forgot-password">
          <ForgotPasswordPage />
        </Route>
        <Route path="/signup">
          <SignUpPage />
        </Route>
      </Switch>
    </Router>
  );
};
