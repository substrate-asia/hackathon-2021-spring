import React from 'react'
import ReactEcharts from 'echarts-for-react'
import moment from 'moment';
import { getRecentMonth } from '../utils/time.util'
import { getColorArr } from '../utils/color.util'

export default function FreqPlot(props) {
  let { x, flowInCount, flowOutCount, delegateCount, undelegateCount } = props.data
  let colorArr = getColorArr()
  if (x && x.length === 0) {
    x = getRecentMonth()
  }
  return (
    <ReactEcharts
      style={{ height: 390 }}
      lazyUpdate={true}
      option={{
        legend: {
          show: true,
          icon: 'roundRect',
          itemWidth: 16,
          itemHeight: 8,
          top: '8px',
          right: '20px',
          height: 1,
          data: [
            'Withdraw',
            'Receive',
            'Delegate',
            'Undelegate',
            'Total',
          ],
        },
        dataZoom: [
          {
            show: true,
            realtime: true,
            start: 80,
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
          name: 'Times',
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
          left: flowInCount && flowInCount.length === 0 ? '36px' : '20px',
          right: '20px',
          bottom: '20px',
          containLabel: true,
          backgroundColor: 'rgba(244, 245, 250, 1)'
        },
        series: [
          {
            name: 'Withdraw',
            data: flowOutCount,
            type: 'line',
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: colorArr[0],
            },
          },
          {
            name: 'Receive',
            data: flowInCount,
            type: 'line',
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: colorArr[2],
            },
          },
          {
            name: 'Delegate',
            data: delegateCount,
            type: 'line',
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: colorArr[3],
            },
          },
          {
            name: 'Undelegate',
            data: undelegateCount,
            type: 'line',
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: colorArr[4],
            },
          },
          // {
          //   name: 'Total',
          //   data: totalCount,
          //   type: 'line',
          //   symbol: 'circle',
          //   symbolSize: 8,
          //   itemStyle: {
          //     color: colorArr[4],
          //   },
          // },
        ],
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
            let date = moment.utc(params[0].axisValueLabel).toDate();
            let html = `<div>${moment(date).format('YYYY/MM/DD')}</div>`;
            let size = '6px';
            for (let param of params) {
              let color = param.color;
              html += '<div>'
              let marker = `<span style="display:inline-block;margin-right:12px;border-radius:${size};width:${size};height:${size};background-color:${color};"></span>`;
              let desc = `${param.seriesName}: ${param.value}`;
              html += marker + desc;
            }
            return html;
          }
        },
      }}
    />
  )
}
