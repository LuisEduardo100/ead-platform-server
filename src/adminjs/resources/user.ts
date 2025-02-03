import { ResourceOptions } from 'adminjs'

const userResourceOptions: ResourceOptions = {
    navigation: 'Administração',
    properties: {
        birth: {
            type: 'date'
        },
        password: {
            type: 'password'
        },
        role: {
            availableValues: [
                { value: 'admin', label: 'Administrador' },
                { value: 'user', label: 'Usuário Padrão' }
            ]
        },
    },
    editProperties: [
        'firstName',
        'lastName',
        'serie',
        'phone',
        'birth',
        'email',
        'password',
        'role',
        'hasFullAccess',
        'emailConfirmed'
    ],
    filterProperties: [
        'firstName',
        'lastName',
        'serie',
        'phone',
        'birth',
        'email',
        'role',
        'emailConfirmed',
        'createdAt',
        'updatedAt'
    ],
    listProperties: [
        'id',
        'serie',
        'emailConfirmed',
        'firstName',
        'email',
        'role'
    ],
    showProperties: [
        'id',
        'firstName',
        'lastName',
        'emailConfirmed',
        'serie',
        'phone',
        'birth',
        'email',
        'role',
        'createdAt',
        'updatedAt',
        'hasFullAccess'
    ],
}

export { userResourceOptions }