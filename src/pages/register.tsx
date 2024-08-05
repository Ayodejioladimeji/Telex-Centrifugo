import React, { useState, useEffect } from 'react';
import { Formik } from 'formik';
import * as EmailValidator from 'email-validator';
import { FaCheck, FaEye, FaEyeSlash, FaTimes } from 'react-icons/fa';


// COMPONENTS
import styles from '../styles/Register.module.css';
import { useRouter } from 'next/router';
import Link from 'next/link';
import cogoToast from 'cogo-toast';


// VALIDATION REGEX
const passwordUpper = /(?=.*[A-Z])/;
const passwordSpecial = /(?=.*[!@#$%^&*])/;
const passwordLower = /(?=.*[a-z])/;
const passwordRegex = /(?=.*[0-9])/;

// REGISTER COMPONENT
const Register = () => {
  const [typePass, setTypePass] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false)

  // handle submit
  const handleSubmit = (values) => {
    localStorage.setItem("user", JSON.stringify(values))
    cogoToast.success('Account Created Successfully')
    router.push("/")
  }


  return (
    <Formik
      initialValues={{ email: '', username: '', password: '' }}
      onSubmit={(values, { setSubmitting }) => {
        handleSubmit(values)
      }}
      //   HANDLING VALIDATION MESSAGES
      validate={(values) => {
        let errors:any = {};

        // EMAIL SECTION
        if (!values.email) {
          errors.email = 'Email is required';
        } else if (!EmailValidator.validate(values.email)) {
          errors.email = 'Invalid email address';
        }

        // USERNAME SECTION
        if (!values.username) {
          errors.username = 'Username is required';
        } else if (values.username.length <= 3) {
          errors.username = 'Username should be more than 3 characters';
        }

        //   THE PASSWORD SECTION
        if (!values.password) {
          errors.password = 'Password is required';
        } else if (values.password.length < 8) {
          errors.password = 'Password must be 8 characters long.';
        } else if (!passwordUpper.test(values.password)) {
          errors.password = 'Password must contain one upperCase letter';
        } else if (!passwordLower.test(values.password)) {
          errors.password = 'Password must contain one lowerCase letter';
        } else if (!passwordRegex.test(values.password)) {
          errors.password = 'Password must contain one number';
        } else if (!passwordSpecial.test(values.password)) {
          errors.password = 'Password must contain one special character';
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
          <div className={styles.register}>
            <div className={styles.register_center}>
              <div className={styles.register_left}>
                <p>
                  Reach out to your loved ones
                  <br /> as soon as you can...
                </p>
              </div>

              <div className={styles.register_right}>
                <div className={styles.register_right_div}>
                  <div className={styles.register_right_top}>
                    <h3>Register Account</h3>
                  </div>

                  <div className={styles.register_right_bottom}>

                    <form onSubmit={handleSubmit}>
                      <div className={styles.form_group}>
                        <label htmlFor='email'>Email Address</label>
                        <input
                          name='email'
                          type='text'
                          placeholder='bright@example.com'
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
                        <label htmlFor='username'>Display Name</label>
                        <input
                          name='username'
                          type='text'
                          placeholder='bright'
                          value={values.username}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          
                        />
                        {errors.email && touched.username && (
                          <div className={styles.input_feedback}>
                            {errors.username}
                          </div>
                        )}
                      </div>

                      <div className={styles.form_group}>
                        <label htmlFor='password'>Password</label>
                        <input
                          name='password'
                          type={typePass ? 'text' : 'password'}
                          placeholder='Enter your password'
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
                          className={errors.password ? styles.eye : styles.eyes}
                          onClick={() => setTypePass(!typePass)}
                        >
                          {typePass ? <FaEyeSlash /> : <FaEye />}
                        </div>
                      </div>

                      <div className={styles.validate}>
                        <p>Your password must have :</p>
                        <div className={styles.check}>
                          {values.password.length >= 8 ? (
                            <FaCheck className={styles.checker} />
                          ) : (
                            <FaTimes className={styles.checking} />
                          )}
                          At least 8 characters in length
                        </div>

                        <div className={styles.check}>
                          {passwordSpecial.test(values.password) ? (
                            <FaCheck className={styles.checker} />
                          ) : (
                            <FaTimes className={styles.checking} />
                          )}
                          At least 1 special character
                        </div>

                        <div className={styles.check}>
                          {passwordLower.test(values.password) ? (
                            <FaCheck className={styles.checker} />
                          ) : (
                            <FaTimes className={styles.checking} />
                          )}
                          At least 1 lower case
                        </div>

                        <div className={styles.check}>
                          {passwordUpper.test(values.password) ? (
                            <FaCheck className={styles.checker} />
                          ) : (
                            <FaTimes className={styles.checking} />
                          )}
                          At least 1 upper case
                        </div>

                        <div className={styles.check}>
                          {passwordRegex.test(values.password) ? (
                            <FaCheck className={styles.checker} />
                          ) : (
                            <FaTimes className={styles.checking} />
                          )}
                          At least 1 one number
                        </div>
                      </div>

                      <div className={styles.form_group}>
                        <button type='submit' disabled={isSubmitting}>
                          {loading === true ? (
                            "Loading..."
                          ) : (
                            'Sign up'
                          )}
                        </button>
                      </div>
                    </form>

                    {/* <div className={styles.social}>
                      <p>Sign up using</p>
                      <div className={styles.social_div}></div>
                    </div> */}

                    <div className={styles.reg}>
                      <small>
                        Already a member? <Link href='/'>Login</Link>
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </Formik>
  );
};

export default Register;
