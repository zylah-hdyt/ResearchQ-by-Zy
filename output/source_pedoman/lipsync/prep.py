"""Cut each pose's mouth out as a sprite and paint the hole with skin, for code lip-sync."""
import numpy as np, json, sys
from PIL import Image
from scipy import ndimage as nd
P = sys.argv[1]
C = {'m_open': (467, 406), 'm_thumb': (467, 407), 'm_think': (484, 397), 'm_point': (469, 412), 'm_warn': (464, 442)}
info = {}
for n, (cx, cy) in C.items():
    a = np.array(Image.open(f'{P}/assets/{n}.png').convert('RGBA')).astype(np.float64)
    x0, y0, x1, y1 = cx - 90, cy - 60, cx + 90, cy + 60
    w = a[y0:y1, x0:x1, :3]
    # skin = median of the window's bright warm pixels
    br = (w[..., 0] > 220) & (w[..., 1] > 170) & (w[..., 1] < 225) & (w[..., 2] > 120) & (w[..., 2] < 190)
    skin = np.median(w[br], 0)
    d = np.sqrt(((w - skin) ** 2).sum(-1))
    ns = d > 55
    lab, k = nd.label(ns)
    # component nearest the centre
    yy, xx = np.nonzero(lab)
    i = np.argmin((yy - 60) ** 2 + (xx - 90) ** 2); comp = lab == lab[yy[i], xx[i]]
    comp = nd.binary_fill_holes(comp)
    ys, xs = np.nonzero(comp)
    bx0, bx1, by0, by1 = xs.min() + x0, xs.max() + x0 + 1, ys.min() + y0, ys.max() + y0 + 1
    full = np.zeros(a.shape[:2], bool); full[y0:y1, x0:x1] = comp
    # sprite: mouth pixels incl. a 3px soft rim
    rim = nd.binary_dilation(full, iterations=3)
    soft = nd.gaussian_filter(rim.astype(float), 1.2) * 255
    pad = 6; sx0, sx1, sy0, sy1 = bx0 - pad, bx1 + pad, by0 - pad, by1 + pad
    spr = a[sy0:sy1, sx0:sx1].copy(); spr[..., 3] = np.minimum(spr[..., 3], soft[sy0:sy1, sx0:sx1])
    Image.fromarray(spr.astype(np.uint8)).save(f'{P}/lip/mo_{n}.png')
    # base: inpaint the dilated hole by diffusion from surrounding skin
    hole = nd.binary_dilation(full, iterations=7)
    b = a.copy(); rgb = b[..., :3]
    rgb[hole] = skin
    for _ in range(600):
        blur = nd.uniform_filter(rgb, size=(3, 3, 1))
        rgb[hole] = blur[hole]
    # add the faint grain the art has so the patch doesn't look plastic
    Image.fromarray(np.clip(b, 0, 255).astype(np.uint8)).save(f'{P}/lip/b_{n}.png')
    info[n] = dict(x=int(sx0), y=int(sy0), w=int(sx1 - sx0), h=int(sy1 - sy0), top=int(by0 - sy0), skin=skin.round().tolist())
    print(n, info[n], 'components', k)
json.dump(info, open(f'{P}/lip/mouth.json', 'w'))
