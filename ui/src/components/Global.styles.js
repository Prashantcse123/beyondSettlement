import ColorsStyles from './Colors.styles';

export default function styles(theme) {
    return Object.assign({}, ColorsStyles(theme), {
        root: {
            fontWeight: '200',
            '*': {
                outline: 'none !important'
            },

            '& h1, & h2, & h3, & h4': {
                fontWeight: '200',
            },

            '& [hidden], & .hidden': {
                display: 'none !important'
            },
            '& [disabled], & .disabled': {
                opacity: '0.6 !important',
                pointerEvents: 'none !important'
            },

            '& .annotorious-editor-button-save': {
                width: '80px',
                outline: 'none !important',
                background: theme.palette.primary.main,
            },
            '& .annotorious-editor-button-cancel': {
                width: '80px',
                outline: 'none !important',
                background: theme.palette.grey.A700,
            }
        },
        formControl: {
            marginRight: theme.spacing.unit,
            marginBottom: theme.spacing.unit * 3,
            width: 250,
        },
        unselectable: {
            '-webkit-user-select': 'none'   /* Safari & Chrome  */,
            '-moz-user-select': 'none'      /* Firefox          */,
            '-ms-user-select': 'none'       /* IE10+/Edge       */,
            userSelect: 'none'              /* Standard         */
        },
        blink: {
            animation: 'blinker 1s linear infinite',
        },
        '@keyframes blinker': {
            '50%': {
                opacity: 0
            }
        },
        invisible: {
            visibility: 'hidden',
        },
        dark: {
            color: "white",
            borderColor: "white",
            '& svg': {

            }
        },
        leftIcon: {
            marginRight: theme.spacing.unit,
        },
        rightIcon: {
            marginLeft: theme.spacing.unit,
        },
        progressContainer: {
            width: "100% !important",
            textAlign: "center",
            marginTop: "16px"
        },
        primary: {
            '& *': {
                color: theme.palette.primary.main
            }
        },
        secondary: {
            '& *': {
                color: theme.palette.secondary.main
            }
        },
        bold: {
            fontWeight: 900,
            '& *': {
                fontWeight: 900
            }
        },
        inline: {
            display: 'inline-block'
        },
        radioLabel: {
            // marginTop: 10,
            marginBottom: 10
        },
        fullWidth: {
            width: '100%'
        },
        halfWidth: {
            width: '50%'
        }
    });
};
