import { database } from '../database/index.js'
import { DataTypes,  Model, Optional } from 'sequelize'
import bcrypt from 'bcrypt'
import { EpisodeInstance } from './Episode.js'
import { randomBytes } from 'crypto'

// type CheckPasswordCallback = (err: Error | undefined, isSame: boolean) => void

export interface UserAttributes {
  id: number
  serie: string
  firstName: string
  lastName: string
  phone: string
  birth: Date
  email: string
  password: string
  role: 'admin' | 'user'
  emailConfirmed: boolean
  confirmationToken: string | null
  hasFullAccess: boolean
  sessionId: string
  subscription: string
  customerId: string
  profileImage: string | null
}

export interface UserCreationAttributes extends Optional<UserAttributes,  'id' | 'sessionId'> {}

export interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {
  // checkPassword: (password: string, callbackfn: CheckPasswordCallback) => void,
  Episodes?: EpisodeInstance[]
}

export const User = database.define<UserInstance, UserAttributes>('users', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  serie: {
    allowNull: false,
    type: DataTypes.ENUM('6º ano', '7º ano', '8º ano', '9º ano')
  },
  firstName: {
    allowNull: false,
    type: DataTypes.STRING
  },
  lastName: {
    allowNull: false,
    type: DataTypes.STRING
  },
  profileImage: {
    type: DataTypes.STRING
  },
  phone: {
    allowNull: false,
    type: DataTypes.STRING
  },
  birth: {
    allowNull: false,
    type: DataTypes.DATE
  },
  email: {
    allowNull: false,
    unique: true,
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    }
  },
  confirmationToken: {
    allowNull: true,
    type: DataTypes.STRING
  },
  emailConfirmed: {
    type: DataTypes.BOOLEAN,
  },
  password: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  role: {
    allowNull: false,
    type: DataTypes.STRING
  },
  hasFullAccess: {
    type: DataTypes.BOOLEAN,
  }, 
  sessionId: {
    type: DataTypes.STRING
  },
  customerId: {
    type: DataTypes.STRING
  },
  subscription: {
    type: DataTypes.STRING
  }
}, {
  hooks: {
    beforeSave: async (user) => {
      if (user.isNewRecord) {
        user.confirmationToken = randomBytes(32).toString('hex')
        user.emailConfirmed = false
      }
      if (user.isNewRecord || user.changed('password')) {
        user.password = await bcrypt.hash(user.password.toString(), 10);
      }
    }
  }
})

// //@ts-ignore
// User.prototype.checkPassword = function(password: string, callbackfn: CheckPasswordCallback) {
//   //@ts-ignore
//   bcrypt.compare(password, this.password, (err, isSame) => {
//     if (err) {
//       callbackfn(err, false)
//     } else {
//       callbackfn(err, isSame)
//     }
//   })
// }

export function checkPassword(password: string, userPassword: string, callbackfn: (err: Error | undefined, isSame: boolean) => void) {
  bcrypt.compare(password, userPassword, (err, isSame) => {
    if (err) {
      callbackfn(err, false)
    } else {
      callbackfn(err, isSame)
    }
  })
}

