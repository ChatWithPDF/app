import axios from 'axios';
import { useCallback, useContext, useState } from 'react';
import { useCookies } from 'react-cookie';
import jwt from 'jsonwebtoken';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { AppContext } from '../context';

export const useLogin = () => {
  const [cookies, setCookie, removeCookie] = useCookies(['access_token']);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const context = useContext(AppContext);
  const router = useRouter();

  const login = useCallback(() => {
    // No need to check for auth if access token is not present
    if (cookies.access_token) {
      const decodedToken = jwt.decode(cookies.access_token);
      const expires = new Date(decodedToken?.exp * 1000);
      // if token not expired then check for auth
      if (expires > new Date()) {
        const token = cookies.access_token;
        axios
          .get(`/api/auth?token=${token}`)
          .then((response) => {
            if (response.data === null) {
              toast.error('Invalid Access Token');
              removeCookie('access_token', { path: '/' });
              localStorage.clear();
              sessionStorage.clear();
              context?.setIsLoggedIn(false);
              console.log('response null');
            } else {
              setIsAuthenticated(true);
              console.log('authenticated true');
            }
          })
          .catch((err) => {
            removeCookie('access_token', { path: '/' });
            localStorage.clear();
            sessionStorage.clear();
            context?.setIsLoggedIn(false);
            console.log('catch err');
          });
      } else {
        removeCookie('access_token', { path: '/' });
        localStorage.clear();
        sessionStorage.clear();
        router.push('/login');
        if (typeof window !== 'undefined') window.location.reload();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookies.access_token, removeCookie, router, context?.setIsLoggedIn]);

  return { isAuthenticated, login };
};
