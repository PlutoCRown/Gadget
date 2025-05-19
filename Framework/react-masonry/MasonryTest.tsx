/* eslint-disable @typescript-eslint/no-explicit-any */
import MasonryGrid from '@/mobile/components/MasonryGrid';
import { memo, useRef } from 'react';
import styled from 'styled-components';
const datagen = () => {
	return {
		id: Math.random().toString(36).substr(2, 9),
		height: Math.random() * 100 + 100,
		text: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Architecto ut, quia voluptate molestiae nulla mollitia unde eligendi repellat blanditiis necessitatibus odio laborum quos animi fugit amet itaque libero cum! Explicabo.'.substring(
			0,
			Math.floor(Math.random() * 50),
		),
	};
};
const data = [
	{ id: '11', height: 110, text: 'Lorem ' },
	{ id: '12', height: 120, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' },
	{ id: '13', height: 130, text: 'dipiscing elit. ' },
	{ id: '14', height: 240, text: 'Lorem ig elit. ' },
	{ id: '15', height: 250, text: 'Lorem ipsumpiscing elit. ' },
	{ id: '16', height: 220, text: 'Lorem ipsum dolor sit amet, consec elit. ' },
	{ id: '17', height: 230, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' },
	{ id: '21', height: 210, text: 'Lorem ' },
	{ id: '22', height: 220, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' },
	{ id: '23', height: 230, text: 'dipiscing elit. ' },
	{ id: '24', height: 240, text: 'Lorem ig elit. ' },
	{ id: '25', height: 250, text: 'Lorem ipsumpiscing elit. ' },
	{ id: '26', height: 120, text: 'Lorem ipsum dolor sit amet, consec elit. ' },
	{ id: '31', height: 110, text: 'Lorem ' },
	{ id: '32', height: 120, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' },
	{ id: '33', height: 130, text: 'dipiscing elit. ' },
	{ id: '34', height: 140, text: 'Lorem ig elit. ' },
	{ id: '35', height: 150, text: 'Lorem ipsumpiscing elit. ' },
	{ id: '36', height: 120, text: 'Lorem ipsum dolor sit amet, consec elit. ' },
];
export const MasonryTest = () => {
	const scrollRef = useRef<HTMLDivElement>(null);
	return (
		<Container ref={scrollRef}>
			<button onClick={() => data.push(datagen())}>添加数据</button>
			<MasonryGrid
				data={data}
				renderer={(item) => <Item item={item} />}
				max={300}
				gap={4}
				distance={0}
				scrollRef={scrollRef}
			/>
		</Container>
	);
};

// 一定要memo啊
const Item = memo(({ item }: any) => {
	// console.log('内容刷新', item.id);
	return (
		<ItemWrapper>
			<div style={{ height: item.height }}>{item.id}</div>
			<pre style={{ position: 'absolute', top: 0, left: 0 }}>
				{JSON.stringify(item.pos, null, 4)}
			</pre>
			<p>{item.text}</p>
		</ItemWrapper>
	);
});

const ItemWrapper = styled.div`
	position: relative;
	overflow: hidden;
	background-color: #f002;
	border-radius: 10px;
	border: 1px solid blue;
	& > div {
		background-color: #f002;
		font-size: 120px;
		font-weight: bold;
		color: #fff6;
		text-align: center;
	}
	& > p {
		padding: 6px;
		word-break: break-all;
	}
`;

const Container = styled.div`
	padding: 20px;
	height: 100vh;
	outline: 1px solid red;
	outline-offset: -20px;
	overflow: scroll;

	&::-webkit-scrollbar {
		display: none;
	}
	scrollbar-width: none;
	-ms-overflow-style: none;
`;
