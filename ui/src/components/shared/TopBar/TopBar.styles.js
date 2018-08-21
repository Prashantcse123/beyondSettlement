import GlobalStyles from '../../Global.styles';
import Colors from '../../ColorsConstants';

export default function styles(theme) {
    return Object.assign({}, GlobalStyles(theme), {
        topBar: {
            position: 'relative',
            zIndex: '2'
        },
        innerToolbar: {
            padding: '0',
        },
        leftArea: {
            padding: '8px 7.5px',
            background: theme.palette.primary.light,
            height: '48px',
            '& img': {
                verticalAlign: 'middle',
                marginLeft: '24px',
                marginRight: '33px',
            }
        },
        appTitle: {
            marginLeft: '22px'
        },
        rightControls: {
            position: 'absolute',
            right: '8px'
        },
        settingsPopover: {
            position: 'absolute !important',
            left: 'auto !important',
            top: '10px !important',
            right: '10px',
            zIndex: '1400 !important'
        },
    });
};
