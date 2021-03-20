import React from 'react'
import ReactEcharts from 'echarts-for-react'
import { getColorArr } from '../utils/color.util'

export default function PlotLine(props) {
  let { data } = props
  return (
    <ReactEcharts
      lazyUpdate={true}
      option={{
        color: getColorArr(),
        grid: {
          show: false,
          containLabel: true,
          backgroundColor: 'transparent'
        },
        title: {
          show: false
        },
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(74, 85, 157, 1)',
          formatter: ({ name, value, percent }) => {
            return `${name}: ${value.toFixed(2)} (${percent}%)`;
          }
        },
        legend: {
          show: false
        },
        series: [
          {
            startAngle: 90,
            legendHoverLink: false,
            // animationType: 'scale',
            // animationEasing: 'elasticOut',
            id: 'funding-balances',
            type: 'pie',
            center: ['50%', '50%'],
            radius: [65, 110],
            avoidLabelOverlap: true,
            selectedMode: 'single',
            minShowLabelAngle: 10,
            label: {
              show: true,
              position: 'inside',
              formatter: ({ percent }) => parseInt(percent) + '%'
            },
            data,
          }
        ]
      }}
    />
  )
}
