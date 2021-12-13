
import { useLocation } from "react-router-dom";

export const useQueryParams = () => {
  const location = useLocation();
  const param = new URLSearchParams(location.search);
  const tokenparam = {token : param.get("token")} 

  return tokemparam;
};
