import React from 'react'
import ReactEcharts from 'echarts-for-react'
import moment from 'moment';
import { moneyFmt } from '../utils/money.util'
import { getRecentMonth } from '../utils/time.util'

export default function PlotLine(props) {
  let { x, y } = props.data
  if (x && x.length === 0) {
    x = getRecentMonth()
  }
  return (
    <ReactEcharts
      style={{ height: 390 }}
      lazyUpdate={true}
      option={{
        legend: {
          show: false
        },
        dataZoom: [
          {
            show: true,
            realtime: true,
            start: 50,
            end: 100,
          },
        ],
        animation: false,
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: x,
          axisLabel: {
            formatter: function (value, index) {
              // 格式化成月/日，只在第一个刻度显示年份
              const local = moment.utc(value).toDate();
              if (index === 0) {
                return moment(local).format('YYYY/MM/DD');
              } else {
                return moment(local).format('MM/DD');
              }
            },
            color: 'rgba(176, 176, 176, 1)',
          },
          axisTick: { show: false },
          axisLine: {
            lineStyle: {
              width: 1,
              color: 'rgba(244, 245, 250, 1)',
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(244, 245, 250, 1)',
              width: 1,
            },
          },
        },
        yAxis: {
          type: 'value',
          name: 'Value(USD)',
          nameTextStyle: {
            color: 'rgba(192, 196, 210, 1)',
            fontWeight: 500,
            fontFamily: 'Roboto-Medium',
            fontSize: 14,
            lineHeight: 16,
            align: 'left',
          },
          // max: this.dataMax,
          min: 0,
          minInterval: 1,
          nameGap: '25',
          axisTick: { show: false },
          axisLine: {
            lineStyle: {
              width: 1,
              color: 'rgba(244, 245, 250, 1)',
            }
          },
          axisLabel: {
            color: 'rgba(176, 176, 176, 1)'
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(244, 245, 250, 1)',
              width: 1,
            },
          },
        },
        grid: {
          show: false,
          top: '52px',
          left: y.length === 0 ? '36px' : '20px',
          right: '20px',
          bottom: '20px',
          containLabel: true,
          backgroundColor: 'rgba(244, 245, 250, 1)'
        },
        series: [{
          data: y,
          type: 'line',
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: 'rgba(93,189,234,1)',
            borderWidth: 3,
            borderColor: 'rgba(255, 255, 255, 0.5)'
          },
          // 高亮时样式
          // emphasis: {
          //   itemStyle: {
          //     // borderWidth: 3,
          //     borderColor: 'rgba(255, 255, 255, 1)'
          //   }
          // },
          lineStyle: {
            normal: {
              width: 3,
              shadowColor: 'rgba(99, 103, 184, 0.4)',
              shadowBlur: 8,
              shadowOffsetY: 8,
              color: 'rgba(137, 142, 255, 1)'
            }
          },
          areaStyle: {
            color: 'rgba(137, 142, 255, 0.08)',
          }
        }],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            z: 0,
            type: 'line',
            lineStyle: {
              type: 'solid',
              width: 1,
              color: '#5DBDEA'
            }
          },
          formatter: params => {
            let { name, value } = params[0]
            if (name && value) {
              let html = ''
              html = `
                <div>
                  <div>${name}</div>
                  <div>${moneyFmt(value)}</div>
                </div>
              `
              return html;
            }
          }
        },

      }}
    />
  )
}
