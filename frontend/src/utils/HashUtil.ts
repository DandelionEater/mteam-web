import bcrypt from 'bcrypt';

const saltRounds = 10;

async function hashPassword(userPassword: string) {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(userPassword, salt);
    console.log('Hashed password:', hash);
  } catch (err) {
    // Handle error
    console.error('Error hashing password:', err);
  }
}

export default hashPassword;
