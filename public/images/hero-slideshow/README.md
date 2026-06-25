# Hero slideshow images

Replace the files in this folder to update the hero carousel.

## Where these are used
- Component: `/components/HeroSlideshow.jsx`
- Section: hero, top of the home page
- Fallback: if a file is missing, the slideshow simply skips that slide

## Filenames (DO NOT rename)
The component looks for these exact files:

```
slide-1.jpg
slide-2.jpg
slide-3.jpg
slide-4.jpg
```

## Replacing the photos

1. Drop your new photos into this folder using the same filenames as above.
2. Recommended size: **1920×1080** (16:9), JPEG, **under ~400 KB** each.
3. Use realistic garage / workshop / car-repair photos. Avoid stock-photo clichés.
4. Commit the files and redeploy on Vercel — that's it.

> No code changes needed when swapping the images.

## Tips for the photos

- Wide-angle, well-lit workshop interior
- A car on a lift mid-service
- Close-up of a mechanic working (clean hands, branded clothing)
- Tools laid out on a clean workbench
- Avoid identifiable customer faces, licence plates, or competitor branding.

## Adding or removing slides

If you want **fewer than 4 slides**: simply delete the extra files — the
slideshow will detect the missing image and skip it gracefully.

If you want **more than 4 slides**: add the new files (`slide-5.jpg`, etc.)
and update the `IMAGES` constant near the top of
`/components/HeroSlideshow.jsx` to include them.
