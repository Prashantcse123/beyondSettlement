import GlobalStyles from '../../Global.styles';
import ProgressBarStyles from '../../ProgressBarTemp.styles';

export default function styles(theme) {
    return Object.assign({}, GlobalStyles(theme), ProgressBarStyles(theme), {
        systemProgress: {
            width: '830px',
            height: '54px',
            lineHeight: '58px',
            textAlign: 'left',
            display: 'inline-block',
            pointerEvents: 'all',
            overflow: 'hidden'
        },
        systemProgressHeader: {
            verticalAlign: 'top',
            display: 'inline-block',
            marginRight: '20px',
            padding: '16px',
            height: '26px',
            lineHeight: '0px'
        },
        targetTitle: {
            display: 'inline-block',
            color: 'white',
            fontSize: '16px',
            position: 'relative',
            top: '2px',
            left: '10px',
            fontWeight: 100,
            verticalAlign: 'top'
        },
        systemProgressBarContainer: {
            display: 'inline-block',
            verticalAlign: 'middle',
            width: '360px'
        },
        systemProgressBar: {
            padding: '0',
            display: 'inline-block',
            width: '200px',
            // verticalAlign: 'middle'
        },
        systemProgressActions: {
            float: 'right',
            display: 'inline-block',
            marginRight: '12px'
        },
    });
};
