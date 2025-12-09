import joi from 'joi';

const registerUser = joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30).required(),
})

const loginUser = joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
})

const weatherQuery = Joi.object({
    city: Joi.string().required(),
    units: Joi.string().valid('metric', 'imperial').default('metric'),
});

module.exports = {
    registerUser,
    loginUser,
    weatherQuery
};