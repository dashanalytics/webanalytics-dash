// Copyright 2024 Jelly Terra
// Use of this source code is governed by the MIT license that can be found in the LICENSE file.

import {ObjectToMap} from "./common.ts";

export class Server {
    public host = ''
    public accessToken = ''
}

export class AccessReport {
    public timestamp = ''

    public country = ''
    public source_ip = ''
    public uuid = ''
    public user_agent = ''
    public deploy_time = ''
    public target = ''
    public time = ''
    public confirmed = 0
}

export function ParseTimestamp(timestamp: string) {
    const sections = timestamp.split(':')
    const second = sections[5].split('.')

    return new Date(+sections[0], +sections[1] - 1, +sections[2], +sections[3], +sections[4], +second[0], +second[1])
}

export function SortTimestamps(timestamps: string[]) {
    timestamps.sort((a, b) => {
        if (ParseTimestamp(a) < ParseTimestamp(b)) {
            return -1
        }
        return 1
    })
}

export function GetHumanUuids(reports: Iterable<AccessReport>) {
    const uuids = new Set<string>()
    for (const report of reports) if (report.confirmed == 1) uuids.add(report.uuid)
    return uuids
}

export function FilterBotReports(reports: Map<string, AccessReport>) {
    const filtered = new Map<string, AccessReport>()
    const humanUuids = GetHumanUuids(reports.values())
    for (const [timestamp, report] of reports) if (humanUuids.has(report.uuid)) filtered.set(timestamp, report)
    return filtered
}

export async function FetchAccessReportsTimestampsByRange(server: Server, start: string, end: string) {
    const resp = await fetch(
        `${server.host}/api/v1/getAccessReportTimestamps?token=${server.accessToken}&start=${start}&end=${end}`
    )
    if (resp.status != 200) {
        throw resp
    }

    const reports: string[] = JSON.parse(await resp.text())

    return reports
}

export async function FetchAccessReportByTimestamp(server: Server, timestamp: string) {
    const resp = await fetch(
        `${server.host}/api/v1/getAccessReportByTimestamp?token=${server.accessToken}&timestamp=${timestamp}`
    )
    if (resp.status != 200) {
        throw resp
    }

    const report: AccessReport = JSON.parse(await resp.text())
    report.timestamp = timestamp

    return report
}

export async function FetchAccessReportsByRange(server: Server, start: string, end: string) {

    const resp = await fetch(`${server.host}/api/v1/getAccessReportsByRange?token=${server.accessToken}&start=${start}&end=${end}`)
    if (resp.status != 200) {
        throw resp
    }

    const reports: Map<string, AccessReport> = ObjectToMap(JSON.parse(await resp.text()))

    for (const [timestamp, report] of reports) {
        report.timestamp = timestamp
    }

    return reports
}

export function DateToTimestamp(date: Date): string {
    let year = date.getFullYear()
    let month = String(date.getMonth() + 1)
    let day = String(date.getDate())
    let hours = String(date.getHours())
    let minutes = String(date.getMinutes())
    let seconds = String(date.getSeconds())
    let mills = String(date.getMilliseconds())

    return `${year}:${month}:${day}:${hours}:${minutes}:${seconds}.:${mills}`
}

export function FormatTime(date: Date) {
    let year = date.getFullYear()
    let month = String(date.getMonth() + 1).padStart(2, '0')
    let day = String(date.getDate()).padStart(2, '0')
    let hours = String(date.getHours()).padStart(2, '0')
    let minutes = String(date.getMinutes()).padStart(2, '0')
    let seconds = String(date.getSeconds()).padStart(2, '0')

    return {year, month, day, hour: hours, minutes, seconds}
}

export function FormatTimeToScore(date: Date) {
    const {year, month, day, hour, minutes, seconds} = FormatTime(date)

    return `${year}${month}${day}${hour}${minutes}${seconds}`
}

export async function FetchAccessReportsByRecentMonths(server: Server, months: number) {
    const now = new Date(Date.now())

    const start = new Date(new Date(now).setMonth(now.getMonth() - months))
    const end = new Date(now)

    return await FetchAccessReportsByRange(server, FormatTimeToScore(start), FormatTimeToScore(end))
}

export function GetCountryReports(reports: AccessReport[]) {
    let countryReports = new Map<string, AccessReport[]>()

    for (const report of reports) countryReports.set(report.country, [])
    for (const report of reports) countryReports.get(report.country)!.push(report)

    return countryReports
}

export function GetReportsByUniqueVisitor(reports: AccessReport[]) {
    let uniqueVisitorReports = new Map<string, AccessReport[]>()

    for (const report of reports) uniqueVisitorReports.set(report.uuid, [])
    for (const report of reports) uniqueVisitorReports.get(report.uuid)!.push(report)

    return uniqueVisitorReports
}

export function GetReportsByUniqueIP(reports: AccessReport[]) {
    let uniqueIPReports = new Map<string, AccessReport[]>()

    for (const report of reports) uniqueIPReports.set(report.source_ip, [])
    for (const report of reports) uniqueIPReports.get(report.source_ip)!.push(report)

    return uniqueIPReports
}

export function GetReportsInRange(reports: Map<string, AccessReport>, start: string, end: string) {
    const inRangeReports = new Map<string, AccessReport>()

    const startDate = ParseTimestamp(start)
    const endDate = ParseTimestamp(end)

    for (const [timestamp, report] of reports) {
        const reportDate = ParseTimestamp(timestamp)
        if (startDate <= reportDate && reportDate <= endDate) { // The `endDate` is usually the last timestamp. Include it.
            inRangeReports.set(timestamp, report)
        }
    }

    return inRangeReports
}

export function GetDailyReports(reports: Map<string, AccessReport>, start: string, end: string) {
    const dailyReports = new Map<string, AccessReport[]>()

    const startDate = ParseTimestamp(start)
    startDate.setHours(0)
    startDate.setMinutes(0)
    startDate.setSeconds(0)

    const endDate = ParseTimestamp(end)
    endDate.setHours(23)
    endDate.setMinutes(59)
    endDate.setSeconds(59)

    for (const cursor = new Date(startDate); cursor <= endDate; cursor.setDate(cursor.getDate() + 1)) {
        const {year, month, day} = FormatTime(cursor)
        dailyReports.set(`${year}/${month}/${day}`, [])
    }


    for (const [timestamp, report] of reports) {
        const reportDate = ParseTimestamp(timestamp)

        if (startDate <= reportDate && reportDate <= endDate) {
            const {year, month, day} = FormatTime(reportDate)
            const key = `${year}/${month}/${day}`
            if (!dailyReports.has(key)) dailyReports.set(key, [])
            dailyReports.get(key)!.push(report)
        }
    }

    return dailyReports
}

export function GetHourlyReports(reports: Map<string, AccessReport>, start: string, end: string) {
    const hourlyReports = new Map<string, AccessReport[]>()

    const startDate = ParseTimestamp(start)
    startDate.setMinutes(0)
    startDate.setSeconds(0)

    const endDate = ParseTimestamp(end)
    endDate.setMinutes(59)
    endDate.setSeconds(59)

    for (const cursor = new Date(startDate); cursor <= endDate; cursor.setHours(cursor.getHours() + 1)) {
        const {year, month, day, hour} = FormatTime(cursor)
        hourlyReports.set(`${year}/${month}/${day}/${hour}`, [])
    }

    for (const [timestamp, report] of reports) {
        const reportDate = ParseTimestamp(timestamp)

        if (startDate <= reportDate && reportDate <= endDate) {
            const {year, month, day, hour} = FormatTime(reportDate)
            const key = `${year}/${month}/${day}/${hour}`
            if (!hourlyReports.has(key)) hourlyReports.set(key, [])
            hourlyReports.get(key)!.push(report)
        }
    }

    return hourlyReports
}
