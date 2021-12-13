import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useToken } from "./../customHook/useToken";
import { EmailVerificationSuccess } from "./../components/EmailVerificationSuccess";
import { EmailVerificationFail } from "./../components/EmailVerificationFailure";

export const EmailVerificationPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const { verificationString } = useParams();
  const [, setToken] = useToken();

  useEffect(() => {
    const verificationReq = async () => {
      try {
        const response = await axios.put("/api/auth/verify-email", {
          verificationString,
        });
        const { token } = response.data;
        setToken(token);
        setIsSuccess(true);
        setIsLoading(false);
      } catch (e) {
        setIsSuccess(false);
        setIsLoading(false);
      }
    };

    verificationReq();
  }, [setToken, verificationString]);

  if (isLoading) return <p>Loading...</p>;
  if (!isSuccess) return <EmailVerificationFail />;
  return <EmailVerificationSuccess />;
};
