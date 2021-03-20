import React from 'react'
import ReactEcharts from 'echarts-for-react'
import moment from 'moment';
import { moneyFmt } from '../utils/money.util'
import { getRecentMonth } from '../utils/time.util'

export default function FlowPlot(props) {
  let { x, flowInArr, flowOutArr, netFlowArr } = props.data
  if (x && x.length === 0) {
    x = getRecentMonth()
  }
  if (flowOutArr && flowOutArr.length > 0) {
    for (let i = 0; i < flowOutArr.length; i++) {
      flowOutArr[i] = -Math.abs(flowOutArr[i])
    }
  }
  return (
    <ReactEcharts
      style={{ height: 390 }}
      lazyUpdate={true}
      option={{
        legend: {
          show: true,
          top: '8px',
          right: '30px',
          itemWidth: 16,
          itemHeight: 8,
          data: [
            'Net Inflows',
            'Flow In',
            'Flow Out',
          ]
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
          boundaryGap: true,
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
            show: false,
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
          left: flowInArr && flowInArr.length > 0 ? '20px' : '40px',
          right: '20px',
          bottom: '20px',
          containLabel: true,
          backgroundColor: 'rgba(244, 245, 250, 1)'
        },
        series: [
          {
            name: 'Net Inflows',
            type: 'bar',
            // barWidth: '10%',
            // barMinHeight: 1,
            itemStyle: {
              color: 'rgba(255, 169, 76, 1)',
              // borderWidth: 3,
              borderColor: 'rgba(255, 169, 76, 1)'
            },
            label: {
              show: false
            },
            data: netFlowArr
          },
          {
            name: 'Flow In',
            type: 'bar',
            stack: '总量',
            label: {
              show: false
            },
            // barWidth: '40%',
            // barMinHeight: 1,
            itemStyle: {
              color: '#898EFF',
              // borderWidth: 3,
              borderColor: '#898EFF'
            },
            data: flowInArr
          },
          {
            name: 'Flow Out',
            type: 'bar',
            stack: '总量',
            // barWidth: '40%',
            // barMinHeight: 1,
            itemStyle: {
              color: '#5DBDEA',
              // borderWidth: 3,
              borderColor: '#5DBDEA'
            },
            label: {
              show: false
            },
            data: flowOutArr
          },
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
            let date = moment.utc(params[0].axisValueLabel).toDate()
            let html = `<div>${moment(date).format('YYYY/MM/DD')}</div>`
            for (let key in params) {
              let { value, seriesName } = params[key]
              let content
              if (seriesName === 'Net Inflows') {
                content = `<div>${seriesName} ${moneyFmt(value, 5)}</div>`
              } else {
                content = `<div>${seriesName} ${moneyFmt(Math.abs(value), 5)}</div>`
              }
              html += content
            }
            return html;
          }
        },
      }}
    />
  )
}
