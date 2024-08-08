import React, { useState } from "react";
import { Formik } from "formik";
import * as EmailValidator from "email-validator";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/router";
import styles from "../styles/Login.module.css";
import Link from "next/link";
import cogoToast from "cogo-toast";
import Image from "next/image";

// VALIDATION REGEX
const passwordUpper = /(?=.*[A-Z])/;
const passwordSpecial = /(?=.*[!@#$%^&*])/;
const passwordLower = /(?=.*[a-z])/;
const passwordRegex = /(?=.*[0-9])/;

// lOGIN COMPONENT
const Login = () => {
  const [typePass, setTypePass] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // handle submit
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://api-golang.boilerplate.hng.tech/api/v1/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        },
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access_token", data.data.access_token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        cogoToast.success("Login successful!");
        router.push(`/message`);
      } else {
        cogoToast.error(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      cogoToast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.logindiv}>
        <div className={styles.sidea}>
          <div className={styles.logo}>
            <Image
              src={"/logo.png"}
              width={1000}
              height={1000}
              className="logo"
              alt="logo"
            />
          </div>{" "}
          <div className={styles.sec}>
            <div className={styles.seccontent}>
              <h1 className={styles.h1}>
                All Your Notifications In One App!!!
              </h1>
              <p className={styles.p}>
                Get real-time notifications per deliverables and achieve
                efficient communication with teammates and your deployed
                solutions.
              </p>
            </div>
            <div className={styles.not}>
              <Image src={"/com.png"} width={1000} height={1000} alt="log" />
            </div>
          </div>
        </div>
        <div className={styles.logincontainer}>
          <div className={styles.loginheader}>
            <h1 className={styles.h1}>Sign in into your telex account</h1>
          </div>
          <Formik
            initialValues={{ email: "", password: "" }}
            onSubmit={(values, { setSubmitting }) => {
              setTimeout(() => {
                handleSubmit(values);
                setSubmitting(false);
              }, 500);
            }}
            //   HANDLING VALIDATION MESSAGES
            validate={(values) => {
              let errors: any = {};

              // EMAIL SECTION
              if (!values.email) {
                errors.email = "Email is Required";
              } else if (!EmailValidator.validate(values.email)) {
                errors.email = "Invalid email address";
              }

              //   THE PASSWORD SECTION
              if (!values.password) {
                errors.password = "Password is Required";
              } else if (values.password.length < 8) {
                errors.password = "Password must be 8 characters long.";
              } else if (!passwordUpper.test(values.password)) {
                errors.password = "Password must contain one UpperCase letter";
              } else if (!passwordLower.test(values.password)) {
                errors.password = "Password must contain one LowerCase letter";
              } else if (!passwordRegex.test(values.password)) {
                errors.password = "password Must contain one number";
              } else if (!passwordSpecial.test(values.password)) {
                errors.password = "password Must contain one special character";
              }

              return errors;
            }}
          >
            {(props) => {
              const {
                values,
                touched,
                errors,
                isSubmitting,
                handleChange,
                handleBlur,
                handleSubmit,
              } = props;

              return (
                <div className={styles.login}>
                  <div className={styles.login_center}>
                    <div className={styles.login_right}>
                      <div className={styles.login_right_div}>
                        <div className={styles.login_right_top}>
                          <h3>Welcome Back!</h3>
                          <p>Sign in to continue</p>
                        </div>

                        <div className={styles.login_right_bottom}>
                          <form onSubmit={handleSubmit}>
                            <div className={styles.form_group}>
                              <label htmlFor="email">Email Address</label>
                              <input
                                name="email"
                                type="text"
                                placeholder="bright@example.com"
                                value={values.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                              {errors.email && touched.email && (
                                <div className={styles.input_feedback}>
                                  {errors.email}
                                </div>
                              )}
                            </div>

                            <div className={styles.form_group}>
                              <label htmlFor="password">Password</label>
                              <input
                                name="password"
                                type={typePass ? "text" : "password"}
                                placeholder="Enter your password"
                                value={values.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                              {errors.password && touched.password && (
                                <div className={styles.input_feedback}>
                                  {errors.password}
                                </div>
                              )}
                              <div
                                className={
                                  errors.password ? styles.eye : styles.eyes
                                }
                                onClick={() => setTypePass(!typePass)}
                              >
                                {typePass ? <FaEyeSlash /> : <FaEye />}
                              </div>
                            </div>

                            <div className={styles.form_group}>
                              <button type="submit" disabled={isSubmitting}>
                                {loading ? "Loading" : "Sign in"}
                              </button>
                            </div>
                          </form>

                          <div className={styles.reg}>
                            <small>
                              Not a member?{" "}
                              <Link href="/register">Register</Link>
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }}
          </Formik>{" "}
        </div>
      </div>
    </>
  );
};

export default Login;
