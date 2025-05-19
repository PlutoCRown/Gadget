import {
	useState,
	useRef,
	useEffect,
	useMemo,
	useCallback,
	useImperativeHandle,
	forwardRef,
	Ref,
	RefObject,
} from 'react';
import styles from './index.module.less';
import classNames from 'classnames';
import { useEventListener, useUpdate } from 'ahooks';

interface Pos {
	id: string;
	top: number;
	left: number;
	height: number;
}

export interface MasonryGridRef {
	scrollContainer: HTMLDivElement | null;
}
interface MasonryGridProps<T> {
	data: T[];
	renderer: (data: T) => React.ReactNode;
	/**
	 * 卡片的最大宽度，默认是300，这使得在移动端形成双列瀑布流
	 */
	max: number;
	/**
	 * 间距，宽高一体，默认为 4
	 */
	gap: number;
	className?: string;
	onScroll?: (scrollEnd: number) => void;
	/**
	 * 预加载范围
	 */
	distance?: number;
	children?: React.ReactNode;
	/**
	 * 滚动元素，强制走外部的滚动容器
	 */
	scrollRef: RefObject<HTMLDivElement>;
	/**
	 * 默认为True，一般情况下不需要调整
	 * 如果设置为False，那么你可以从item中获取到自身的位置，这可能导致renderer每次都刷新！
	 */
	pure?: boolean;
}

const ENABLE_LOG = false;
const log = ENABLE_LOG ? console.log : () => {};

const MasonryGrid = <T extends { id: string }>(
	{
		data,
		renderer,
		max = 300,
		gap = 4,
		className,
		onScroll,
		distance = 1000,
		children,
		scrollRef,
		pure = true,
		// loadingMoreRender = <BaseLoadingV2 style={{ marginTop: 10 }} />,
	}: MasonryGridProps<T>,
	ref: Ref<MasonryGridRef>,
) => {
	const [positions, setPositions] = useState<Map<string, Pos>>(new Map());
	const containerRef = useRef<HTMLDivElement>(null);
	const innerScrollRef = useRef<HTMLDivElement>(null);
	const heightMap = useRef(new Map<string, number>()); // 记录每个 `id` 的高度
	const columnHeights = useRef<number[]>([]); // 记录每列的累积高度
	const [contentWidth, setWidth] = useState(0);
	const scrollTop = useRef<number>(0);
	const [count, setCount] = useState(0);

	useEffect(() => {
		if (containerRef.current) {
			const width = containerRef.current.clientWidth;
			if (width) setWidth(width);
		}
	}, [containerRef.current]);

	const curScrollEle = scrollRef?.current || innerScrollRef.current;
	const columnCount = useMemo(
		() => Math.max(1, Math.ceil((contentWidth + gap) / max)),
		[max, gap, contentWidth],
	);

	const itemWidth = useMemo(
		() => (contentWidth - (columnCount - 1) * gap) / columnCount,
		[columnCount, contentWidth],
	);

	useImperativeHandle(ref, () => ({
		scrollContainer: curScrollEle,
		containerRef: containerRef.current,
	}));

	const calculatePositions = useCallback(() => {
		log('全部重算位置');
		if (columnCount === 0 || !data.length) return;

		const newColumnHeights = Array(columnCount).fill(0) as number[];
		const newPositions = new Map<string, Pos>();

		data.forEach((item) => {
			const height = heightMap.current.get(item.id) || 0;
			const minColIndex = newColumnHeights.indexOf(Math.min(...newColumnHeights));
			const paddingLeft = parseFloat(getComputedStyle(containerRef.current!).paddingLeft || '0');

			newPositions.set(item.id, {
				id: item.id,
				top: newColumnHeights[minColIndex],
				left: minColIndex * (itemWidth + gap) + paddingLeft,
				height,
			});

			newColumnHeights[minColIndex] += height + gap;
		});

		columnHeights.current = newColumnHeights;
		setPositions(newPositions);
	}, [columnCount, gap, data, itemWidth]);

	// GPT写的，居然可以写 函数刷新就执行函数 这样的逻辑。。
	useEffect(calculatePositions, [calculatePositions, count]);
	const viewportHeight = useMemo(() => curScrollEle?.offsetHeight || innerHeight, [count]);

	// 注意这个函数完成之后应该使得新元素发生重新排版
	const handleItemMount = (id: string, element: HTMLDivElement) => {
		const height = element.offsetHeight;
		if (heightMap.current.get(id) !== height) {
			log('首次挂载了', id);
			heightMap.current.set(id, height);
			setCount(count + 1);
		}
	};

	const containerHeight = Math.max(...columnHeights.current, 0);
	// 屏幕外过滤逻辑
	const isVisible = (pos?: Pos): boolean => {
		if (!pos) return true;
		const { top, height } = pos;
		return (
			top + height >= scrollTop.current - distance &&
			top <= scrollTop.current + viewportHeight + distance
		);
	};
	const update = useUpdate();

	useEventListener(
		'scroll',
		(event) => {
			const target = event.target as HTMLDivElement;
			if (target) {
				scrollTop.current = target.scrollTop;
				// 传距离底部的距离出去
				containerRef.current &&
					onScroll?.(containerRef.current.clientHeight - scrollTop.current - target.clientHeight);
				update();
			}
		},
		{ target: curScrollEle },
	);

	return (
		<div className={classNames(styles.masonryGridContainer, className)} ref={innerScrollRef}>
			<div className={styles.masonryGrid} style={{ height: containerHeight }} ref={containerRef}>
				{data.map((item) => {
					const pos = positions.get(item.id);
					if (!isVisible(pos)) return null; // 屏幕外不渲染
					return (
						<div
							key={item.id}
							className={styles.masonryItem}
							style={{
								transform: `translate(${pos?.left || 0}px, ${pos?.top || 0}px)`,
								width: itemWidth,
							}}
							ref={(el) => el && handleItemMount(item.id, el)}
						>
							{renderer(pure ? item : Object.assign({ pos }, item))}
						</div>
					);
				})}
			</div>
			{children}
		</div>
	);
};

export default forwardRef(MasonryGrid);
