export const hoverableStyles = {
  base: {
    cursor: 'help',
    borderBottom: '1px dotted #8c8c8c',
    transition: 'color 0.3s',
  } as const,
  hover: {
    color: '#1890ff',
  } as const,
};

export const getHoverableProps = () => ({
  style: hoverableStyles.base,
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.color = hoverableStyles.hover.color;
  },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.color = 'inherit';
  },
}); 