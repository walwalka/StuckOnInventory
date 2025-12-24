import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { jwtSecret } from '../config.js';
import { pool } from '../database/database.js';

/**
 * Configure Passport with JWT strategy
 * @param {Object} passport - Passport instance
 */
export default function configurePassport(passport) {
  const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret,
  };

  passport.use(
    new JwtStrategy(options, async (jwtPayload, done) => {
      try {
        // Extract user ID from token payload
        const userId = jwtPayload.userId;

        // Query user from database
        const result = await pool.query(
          'SELECT id, email, email_verified, role, created_at FROM users WHERE id = $1',
          [userId]
        );

        if (result.rows.length === 0) {
          return done(null, false, { message: 'User not found' });
        }

        const user = result.rows[0];

        // Return user object (will be attached to req.user)
        return done(null, user);
      } catch (error) {
        console.error('Error in Passport JWT strategy:', error);
        return done(error, false);
      }
    })
  );
}
