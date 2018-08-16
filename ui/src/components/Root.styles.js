export default function styles(theme) {
    return {
        '@global': {
            html: {
                overflow: 'hidden',
                fontFamily: 'Robotto, sans-serif',
                '& *': { fontWeight: '100' }
            },
            body: {
                margin: '0'
            },
            'html, body, #root': {
                height: '100%',
                width: '100%'
            }
        }
    };
};
