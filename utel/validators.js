module.exports.validateRegisterInput = (
  username,
  email,
  password,
  confirmedPassword
) => {
  const errors = {};
  if (username.trim() === "") {
    errors.username = "Username must not be empty";
  }
  if (email.trim() === "") {
    errors.email = "email must not be empty";
  } else {
    var pattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
    if (!email.match(pattern)) {
      errors.email = "email must be valid";
    }
  }
  if (password === "") {
    errors.password = "password must not be empty";
  } else if (password !== confirmedPassword) {
    errors.confirmedPassword = "passwords must match";
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateLoginInput = (username, password) => {
  const errors = {};
  if (username.trim() === "") {
    errors.username = "Username must not be empty";
  }
  if (password.trim() === "") {
    errors.password = "password must not be empty";
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};
