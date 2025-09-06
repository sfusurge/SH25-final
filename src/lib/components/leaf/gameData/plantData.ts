// Simple plant data (no types/enums yet). Each plant lives under its bucket folder.

export const plantData = [
    {
        id: 1,
        key: 'plant1',
        imageSrc: '/assets/experiences/leaf/plant/plant1.png',
        altText: 'Monstera',
        // width uses vw; left/top inherit from bucket; adjust via transform
        position: {
            width: '15%',
            transform: 'translate(-57%, -88%)'
        },
        mobilePosition: {
            width: '40%',
            transform: 'translate(-57%, -88%)'
        },
        points: 100,
    },
    {
        id: 2,
        key: 'plant2',
        imageSrc: '/assets/experiences/leaf/plant/plant2.png',
        altText: 'River Vine',
        position: {
            width: '50%',
            transform: 'translate(-40%, -42%)'
        },
        mobilePosition: {
            width: '100%',
            transform: 'translate(-40%, -42%)'
        },
        points: 3000,
    },
    {
        id: 3,
        key: 'plant3',
        imageSrc: '/assets/experiences/leaf/plant/plant3.png',
        altText: 'Tomato',
        position: {
            width: '6.5%',
            transform: 'translate(-56%, -95%)'
        },
        mobilePosition: {
            width: '18%',
            transform: 'translate(-52%, -97%)'
        },
        points: 20,
    },
    {
        id: 4,
        key: 'plant4',
        imageSrc: '/assets/experiences/leaf/plant/plant4.png',
        altText: 'Staff Stick',
        position: {
            width: '6%',
            transform: 'translate(-50%, -85%)'
        },
        mobilePosition: {
            width: '15%',
            transform: 'translate(-52%, -90%)'
        },
        points: 5,
    },
    {
        id: 5,
        key: 'plant5',
        imageSrc: '/assets/experiences/leaf/plant/plant5.png',
        altText: 'Mega Carrot',
        position: {
            width: '7%',
            transform: 'translate(-50%, -97%)'
        },
        mobilePosition: {
            width: '20%',
            transform: 'translate(-52%, -96.55%)'
        },
        points: 99999,
    },
    {
        id: 6,
        key: 'plant6',
        imageSrc: '/assets/experiences/leaf/plant/plant6.png',
        altText: 'Giant Dandelion',
        position: {
            width: '11%',
            transform: 'translate(-32%, -90%)'
        },
        mobilePosition: {
            width: '25%',
            transform: 'translate(-32%, -96.55%)'
        },
        points: 250,
    }
];

export const plantKeys: string[] = plantData.map((p) => p.key);
