class InvalidEmailError extends Error {
  constructor() {
    super();
    this.code = 1098;
    this.message = 'Invalid Email Format';
    this.status = 400;
  }
};

class InvalidPasswordError extends Error {
  constructor() {
    super();
    this.code = 1097;
    this.message = 'Invalid Password Format';
    this.status = 400;
  }
};

class DuplicateEmailError extends Error {
  constructor() {
    super();
    this.code = 1099;
    this.message = 'Duplicate Email Error';
    this.status = 400;
  }
};

class ServerError extends Error {
  constructor() {
    super();
    this.code = 2000;
    this.message = 'Server Error';
    this.status = 500;
  }
};

class NotExistEmailError extends Error {
  constructor() {
    super();
    this.code = 1096;
    this.message = 'Not Exist Email Error';
    this.status = 404;
  }
};

class NotCorrectPasswordError extends Error {
  constructor () {
    super();
    this.code = 1095;
    this.message = 'Password Is Not Correct';
    this.status = 400;
  }
};

class FontNotFoundError extends Error {
  constructor() {
    super();
    this.code = 1094;
    this.message = 'The Font Is Not Exist';
    this.staus = 404;
  }
};

class InvalidParameterError extends Error {
  constructor(param) {
    super(param);
    this.code = 1093;
    this.message = `Wrong ${param} Parameter Request`;
    this.status = 400;
  }
};

class FontAlreadyExistError extends Error {
  constructor(param) {
    super(param);
    this.code = 1092;
    this.message = param;
    this.status = 400;
  }
};

const ERRORS = {
  InvalidEmailError,
  InvalidPasswordError,
  DuplicateEmailError,
  ServerError,
  NotExistEmailError,
  NotCorrectPasswordError,
  FontNotFoundError,
  InvalidParameterError,
  FontAlreadyExistError
};

module.exports = ERRORS;
