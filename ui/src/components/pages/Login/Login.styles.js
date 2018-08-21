import GlobalStyles from '../../Global.styles';

export default function styles(theme) {
    return Object.assign({}, GlobalStyles(theme), {
        loginPage: {
            textAlign: 'center'
        },
        loginContainer: {
            display: 'inline-block',
            width: '310px',
            marginTop: '100px',
            padding: '20px',
            background: 'white',
            boxShadow: '0 0 20px lightgray',
            borderRadius: '6px'
        },
        loginField: {
            display: 'block !important'
        },
        sfLogo: {
            width: '45px',
            marginRight: '5px'
        }
    });
};
