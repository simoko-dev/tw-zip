import { assertType, expect, test } from 'vitest'

import type { ICity, IDistrict } from '../src'
import { getCityArray, getData, getDistrictArray, getDistricts, getFlatArray, getZipCode } from '../src'

test('getData', () => {
  assertType<ICity>(getData())
})

test('getCityArray', () => {
  expect(getCityArray()).toMatch('嘉義縣')
})

test('getDistricts', () => {
  assertType<IDistrict>(getDistricts('台北市'))
})

test('getDistrict', () => {
  expect(getDistricts()).toMatchObject({ 太麻里鄉: '963' })
})

test('getDistricts', () => {
  expect(JSON.stringify(getDistrictArray(null, { label: 'key' }))).contains('{"key":"峨嵋鄉","value":"315"},{"key":"中壢區","value":"320"}')
})

test('getFlatArray', () => {
  expect(getFlatArray({ city: '嘉義市', symbol: '#' })).toMatchObject(['600#嘉義市#東區', '600#嘉義市#西區'])
})

test('getZipCode', () => {
  expect(getZipCode('三民區')).toEqual(['807', '高雄市', '三民區'])
})
