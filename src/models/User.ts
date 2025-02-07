import { database } from '../database/index.js'
import { DataTypes,  Model, Optional } from 'sequelize'
import bcrypt from 'bcrypt'
import { EpisodeInstance } from './Episode.js'
import { randomBytes } from 'crypto'

// type CheckPasswordCallback = (err: Error | undefined, isSame: boolean) => void

export interface UserAttributes {
  id: number;
  serie: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  phone: string;
  birth: Date;
  email: string;
  password: string;
  role: 'admin' | 'user';
  emailConfirmed: boolean;
  confirmationToken: string | null;
  hasFullAccess: boolean;
  sessionId: string | null;
  subscriptionId: string | null; 
  subscriptionStatus: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'inactive';
  subscriptionStartDate: Date | null; 
  subscriptionRenewalDate: Date | null; 
  paymentMethod: string | null;
  stripeCustomerId: string | null;
  latestInvoiceId: string | null; // Campo adicionado
  subscriptionCanceledAt: Date | null;
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
    type: DataTypes.STRING
  },
  role: {
    allowNull: false,
    type: DataTypes.STRING
  },
  hasFullAccess: {
    type: DataTypes.BOOLEAN,
  }, 
  stripeCustomerId: {
    field: "stripe_customer_id",
    type: DataTypes.STRING,
  },
  subscriptionCanceledAt: {
    field: "subscription_canceled_at",
    type: DataTypes.DATE,
    allowNull: true,
  },
  latestInvoiceId: {
    field: "latest_invoice_id", // Mapeia para snake_case no banco de dados
    type: DataTypes.STRING,
    allowNull: true,
  },
  sessionId: {
    type: DataTypes.STRING
  },
  subscriptionId: {
    type: DataTypes.STRING
  },
  subscriptionStatus: {
    type: DataTypes.ENUM('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'inactive'),
    defaultValue: 'inactive',
    validate: {
        isIn: [['active', 'trialing', 'past_due', 'canceled', 'unpaid', 'inactive']]
    }
},
  subscriptionStartDate: {
    field: "subscription_start_date",
    type: DataTypes.DATE
  },
  subscriptionRenewalDate: {
    field: "subscription_renewal_date",
    type: DataTypes.DATE
  },
  paymentMethod: {
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

