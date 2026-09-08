export const setClipboard = (value: string) => {
    const clip = document.createElement('textarea');
    clip.value = value;
    document.body.appendChild(clip);
    clip.select();
    document.execCommand('copy');
    document.body.removeChild(clip);
};