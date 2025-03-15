import passport from "passport";
import { Strategy } from "passport-local";
import EmialUser from "../shemas/EmailUser.mjs";


export default passport.use(
  new Strategy(async (username, password, done) => {
    try {
      const findUser = await EmialUser.findOne({ username });
      if (!findUser) throw new Error("User not found");
      if (!comparePassword(password, findUser.password))
        throw new Error("Bad Credentials");
      done(null, findUser);
    } catch (err) {
      done(err, null);
    }
  })
);