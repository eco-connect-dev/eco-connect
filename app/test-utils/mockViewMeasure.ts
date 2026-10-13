/* eslint-disable @typescript-eslint/no-require-imports */
export function mockViewMeasureInWindow(
    x = 0,
    y = 0,
    width = 100,
    height = 40,
) {
    const impl = (callback: (x: number, y: number, width: number, height: number) => void) => {
        callback(x, y, width, height);
    };

    try {
        const MockNativeMethods = require("@react-native/jest-preset/jest/MockNativeMethods").default;
        if (MockNativeMethods?.measureInWindow) {
            MockNativeMethods.measureInWindow.mockImplementation(impl);
        }
    } catch {}

    try {
        const { View } = require("react-native");
        if (View?.prototype) {
            if (typeof View.prototype.measureInWindow?.mockImplementation === "function") {
                View.prototype.measureInWindow.mockImplementation(impl);
            } else {
                View.prototype.measureInWindow = jest.fn(impl);
            }
        }
    } catch {}
}

export function getFirstPressable(root: any): any {
    const queue = [root];
    while (queue.length > 0) {
        const node = queue.shift();
        if (!node) continue;
        if (typeof node.props?.onPress === "function") {
            return node;
        }
        if (Array.isArray(node.children)) {
            queue.push(...node.children);
        }
    }
    return null;
}
