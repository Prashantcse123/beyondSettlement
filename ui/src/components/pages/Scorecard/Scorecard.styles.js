import GlobalStyles from '../../Global.styles';

export default function styles(theme) {
    return Object.assign({}, GlobalStyles(theme), {
        scorecard: {
            position: 'relative',
            height: '100%',
            overflow: 'hidden',
            '& tr[class*="-selected-"]': {
                textDecoration: 'line-through'
            }
        },
        bottomTabs: {
            position: 'absolute',
            bottom: 10,
            left: 10
        },
        bottomTabsButton: {
            marginRight: 10,
            boxShadow: 'none'
        }
    });
};
