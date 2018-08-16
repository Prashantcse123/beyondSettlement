import GlobalStyles from '../../Global.styles';

export default function styles(theme) {
    return Object.assign({}, GlobalStyles(theme), {
        scorecard: {
            height: '100%',
            overflow: 'hidden',
            '& tr[class*="-selected-"]': {
                textDecoration: 'line-through'
            }
        }
    });
};
