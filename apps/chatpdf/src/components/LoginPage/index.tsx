import React, { useContext, useState } from "react";
import styles from "./index.module.css";
import { AppContext } from "../../context";
import toast from "react-hot-toast";
import { HStack, PinInputField, PinInput } from "@chakra-ui/react";
import { useCookies } from "react-cookie";
import jwt_decode from "jwt-decode";
import logo from "../../assets/images/logo.png";
import Image from "next/image";

const LoginPage = () => {
  const context = useContext(AppContext);
  const [phone, setPhone] = useState("");
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [input3, setInput3] = useState("");
  const [input4, setInput4] = useState("");
  const [cookie, setCookie, removeCookie] = useCookies();
  const [sendOtpDisabled, setSendOtpDisabled] = useState(false);
  const [loginDisabled, setLoginDisabled] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const sendOTP = () => {
    if (phone.length !== 10) {
      toast.error("Please enter a valid phone number!");
    } else {
      if (navigator.onLine) {
        setSendOtpDisabled(true);
        toast.success("OTP sent");
        fetch(
          `${process.env.NEXT_PUBLIC_OTP_BASE_URL}/api/sendOTP?phone=${phone}`,
          { method: "GET" }
        )
          .then((response) => {
            if (response.status === 200) {
              setOtpSent(true);
            } else {
              setSendOtpDisabled(false);
              toast.error("Could not send OTP, please try again later.");
            }
          })
          .catch((err) => {
            toast.error("OTP service down, please try again later.");
          });
      } else {
        toast.error("No internet connection");
      }
    }
  };

  const login = () => {
    if (navigator.onLine) {
      setLoginDisabled(true);
      const toastId = toast.loading("Please wait, logging in.");
      const inputOTP: string = input1 + input2 + input3 + input4;
      if (inputOTP.length === 4) {
        fetch(`${process.env.NEXT_PUBLIC_OTP_BASE_URL}/api/login/otp`, {
          method: "POST",
          body: JSON.stringify({
            loginId: phone,
            password: inputOTP,
            applicationId: process.env.NEXT_PUBLIC_USER_SERVICE_APP_ID,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("token:", { data });
            toast.dismiss(toastId);
            if (data.params.status === "Success") {
              let expires = new Date();
              expires.setTime(
                expires.getTime() +
                  data.result.data.user.tokenExpirationInstant * 1000
              );
              removeCookie("access_token");
              setCookie("access_token", data.result.data.user.token, {
                path: "/",
                expires,
              });
              // @ts-ignore
              localStorage.setItem("phoneNumber", phone);
              const decodedToken = jwt_decode(data.result.data.user.token);
              //@ts-ignore
              localStorage.setItem("userID", decodedToken?.sub);
              // localStorage.setItem('auth', data.result.data.user.token);

              fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/user/profile/${phone}`, {
                headers: {
                  Authorization: `Bearer ${data.result.data.user.token}`
                }
              })
                .then((response) => response.json())
                .then((data) => {
                  data.firstName && localStorage.setItem("username", data.firstName);
                  context?.setIsLoggedIn(true);
                })
                .catch((err) => {
                  toast.error("Could not get employee details");
                  context?.setIsLoggedIn(true);
                });
            } else {
              setLoginDisabled(false);
              toast.error("Incorrect OTP");
            }
          })
          .catch((err) => {
            toast.dismiss(toastId);
            console.log(err);
          });
      }
    } else {
      toast.error("No internet connection");
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles.topSection}>
        <div className={styles.logo}>
          <Image
            src={logo}
            alt="Samagra logo"
            height={55}
            width={220}
            priority
          />
        </div>
        {!otpSent ? (
          <div className={styles.content}>
            <div className={styles.container}>
              <img src="/login.svg" className={styles.loginImg} />
              <div className={`${styles.title} font-bold font-primary`}>
                Login
              </div>
              <input
                className={styles.input}
                type="text"
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
              />
              <button
                className={styles.btn}
                onClick={sendOTP}
                disabled={sendOtpDisabled}
              >
                Send OTP
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.content}>
            <div className={styles.container}>
              <img src="/login.svg" className={styles.loginImg} />

              <div className={`${styles.title} font-bold font-primary`}>
                Enter OTP
              </div>
              {/* @ts-ignore */}
              <HStack style={{ margin: "24px", justifyContent: "center" }}>
                <PinInput otp placeholder="">
                  <PinInputField
                    className={styles.pinInputField}
                    value={input1}
                    onChange={(e) => setInput1(e.target.value)}
                  />
                  <PinInputField
                    className={styles.pinInputField}
                    value={input2}
                    onChange={(e) => setInput2(e.target.value)}
                  />
                  <PinInputField
                    className={styles.pinInputField}
                    value={input3}
                    onChange={(e) => setInput3(e.target.value)}
                  />
                  <PinInputField
                    className={styles.pinInputField}
                    value={input4}
                    onChange={(e) => setInput4(e.target.value)}
                  />
                </PinInput>
              </HStack>
              <button
                className={styles.btn}
                onClick={login}
                disabled={loginDisabled}
              >
                Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
