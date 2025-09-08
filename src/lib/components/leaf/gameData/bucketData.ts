export interface BucketPosition {
    left: string;
    top: string;
    width: string;
}

export interface BucketImages {
    default: string;
    available: string; // available & out_of_stock can share same image
    outOfStock: string;
}

export interface BucketData {
    id: number;
    key: string; // stable key used by game logic/orders
    images: BucketImages;
    altText: string;
    position: BucketPosition;
    mobilePosition?: BucketPosition;
    availablePosition?: BucketPosition; // optional alternate position when Available
}

export const bucketData: BucketData[] = [
    {
        id: 1,
        key: 'bucket1',
        images: {
            default: '/assets/experiences/leaf/bucket1/default.png',
            available: '/assets/experiences/leaf//bucket1/available.png',
            outOfStock: '/assets/experiences/leaf//bucket1/available.png'
        },
        altText: 'Bucket 1',
        position: {
            left: '20%',
            top: '61.13%',
            width: '8%'
        },
        mobilePosition: {
            left: '12%',
            top: '58%',
            width: '15%'
        }
    },
    {
        id: 2,
        key: 'bucket2',
        images: {
            default: '/assets/experiences/leaf/bucket1/default.png',
            available: '/assets/experiences/leaf/bucket1/available.png',
            outOfStock: '/assets/experiences/leaf/bucket1/available.png'
        },
        altText: 'Bucket 2',
        position: {
            left: '30%',
            top: '72%',
            width: '5.5%'
        },
        mobilePosition: {
            left: '25%',
            top: '67.5%',
            width: '12%'
        }
    },
    {
        id: 3,
        key: 'bucket3',
        images: {
            default: '/assets/experiences/leaf/bucket1/default.png',
            available: '/assets/experiences/leaf/bucket1/available.png',
            outOfStock: '/assets/experiences/leaf/bucket1/available.png'
        },
        altText: 'Bucket 3',
        position: {
            left: '38%',
            top: '56%',
            width: '7%'
        },
        mobilePosition: {
            left: '34%',
            top: '50%',
            width: '13%'
        }
    },
    {
        id: 4,
        key: 'bucket4',
        images: {
            default: '/assets/experiences/leaf/bucket1/default.png',
            available: '/assets/experiences/leaf/bucket1/available.png',
            outOfStock: '/assets/experiences/leaf/bucket1/available.png'
        },
        altText: 'Bucket 4',
        position: {
            left: '61%',
            top: '60%',
            width: '5%'
        },
        mobilePosition: {
            left: '65%',
            top: '50%',
            width: '10%'
        }
    },
    {
        id: 5,
        key: 'bucket5',
        images: {
            default: '/assets/experiences/leaf/bucket2/default.png',
            available: '/assets/experiences/leaf/bucket2/available.png',
            outOfStock: '/assets/experiences/leaf/bucket2/available.png'
        },
        altText: 'Bucket 5',
        position: {
            left: '68%',
            top: '78%',
            width: '14%'
        },
        mobilePosition: {
            left: '72%',
            top: '70%',
            width: '25%'
        }
    },
    {
        id: 6,
        key: 'bucket6',
        images: {
            default: '/assets/experiences/leaf/bucket2/default.png',
            available: '/assets/experiences/leaf/bucket2/available.png',
            outOfStock: '/assets/experiences/leaf/bucket2/available.png'
        },
        altText: 'Bucket 6',
        position: {
            left: '78%',
            top: '67%',
            width: '8%'
        },
        mobilePosition: {
            left: '88%',
            top: '58%',
            width: '20%'
        }
    }
];

export const itemKeys: string[] = bucketData.map(b => b.key);
