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
        'hasFullAccess'
    ],
    filterProperties: [
        'firstName',
        'lastName',
        'serie',
        'phone',
        'birth',
        'email',
        'role',
        'createdAt',
        'updatedAt'
    ],
    listProperties: [
        'id',
        'serie',
        'firstName',
        'email',
        'role'
    ],
    showProperties: [
        'id',
        'firstName',
        'lastName',
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