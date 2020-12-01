import styles from './styles.module.css';

function toCamelCase(name) {
  return name
    .split('-')
    .map((s, index) =>
      index === 0 ? s : `${s[0].toUpperCase()}${s.substring(1)}`
    )
    .join('');
}

export function cls(name, additionalClasses = '') {
  const clsName = toCamelCase(name);
  if (styles[clsName]) {
    return additionalClasses
      ? `${styles[clsName]} ${name} ${additionalClasses}`
      : `${styles[clsName]} ${name}`;
  }
  // Fallback to just return name and maybe additional classes
  return additionalClasses ? `${name} ${additionalClasses}` : name;
}

export function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
