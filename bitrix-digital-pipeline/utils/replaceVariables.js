module.exports = ({
    html,
    variables
}) => {
    html = (html || '') + '';

    Object.entries(variables).forEach(([variableName, value]) => {
        html = html.split(`{{ ${variableName} }}`).join(value);
    });

    return html;
};
