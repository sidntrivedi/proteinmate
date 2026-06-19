import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  safe: {
    flex: 1,
    backgroundColor: '#f7f3ea'
  },
  page: {
    padding: 18,
    paddingBottom: 40,
    gap: 18
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  kicker: {
    color: '#5d6f66',
    fontSize: 14,
    fontWeight: '700'
  },
  title: {
    color: '#142b27',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 32,
    maxWidth: 290
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: '#fffaf0',
    borderColor: '#e2d8c3',
    borderRadius: 18,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    width: 46
  },
  hero: {
    borderRadius: 30,
    padding: 22
  },
  heroTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  heroLabel: {
    color: '#536a61',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  heroValue: {
    color: '#142b27',
    fontSize: 54,
    fontWeight: '900',
    lineHeight: 62
  },
  heroUnit: {
    color: '#536a61',
    fontSize: 23,
    fontWeight: '800'
  },
  streakPill: {
    alignItems: 'center',
    backgroundColor: '#fff7e6',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  streakText: {
    color: '#7a331f',
    fontSize: 13,
    fontWeight: '800'
  },
  progressTrack: {
    backgroundColor: 'rgba(20,43,39,0.14)',
    borderRadius: 99,
    height: 15,
    marginTop: 18,
    overflow: 'hidden'
  },
  progressFill: {
    backgroundColor: '#0d5f4b',
    borderRadius: 99,
    height: '100%'
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18
  },
  statNumber: {
    color: '#142b27',
    fontSize: 22,
    fontWeight: '900'
  },
  statLabel: {
    color: '#61746b',
    fontSize: 13,
    fontWeight: '700'
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12
  },
  primaryAction: {
    alignItems: 'center',
    backgroundColor: '#16302b',
    borderRadius: 20,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    padding: 15
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900'
  },
  secondaryAction: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#ded4c1',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    paddingHorizontal: 18
  },
  secondaryActionText: {
    color: '#16302b',
    fontSize: 14,
    fontWeight: '900'
  },
  section: {
    gap: 12
  },
  sectionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  sectionTitle: {
    color: '#142b27',
    fontSize: 20,
    fontWeight: '900'
  },
  sourceBadge: {
    alignItems: 'center',
    backgroundColor: '#fff2c4',
    borderRadius: 99,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  sourceText: {
    color: '#6a4d0e',
    fontSize: 12,
    fontWeight: '800'
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: '#fffaf0',
    borderColor: '#ded4c1',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14
  },
  searchInput: {
    color: '#142b27',
    flex: 1,
    fontSize: 16,
    minHeight: 50
  },
  clearSearchButton: {
    alignItems: 'center',
    backgroundColor: '#eee5d6',
    borderRadius: 99,
    height: 28,
    justifyContent: 'center',
    width: 28
  },
  mealTabs: {
    flexDirection: 'row',
    gap: 8
  },
  mealTab: {
    alignItems: 'center',
    backgroundColor: '#ede5d7',
    borderRadius: 14,
    flex: 1,
    paddingVertical: 10
  },
  mealTabActive: {
    backgroundColor: '#16302b'
  },
  mealTabText: {
    color: '#536a61',
    fontSize: 12,
    fontWeight: '900'
  },
  mealTabTextActive: {
    color: '#fff'
  },
  foodList: {
    gap: 9
  },
  searchEmpty: {
    alignItems: 'center',
    backgroundColor: '#fffaf0',
    borderColor: '#e4dac8',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12
  },
  searchEmptyCopy: {
    flex: 1
  },
  searchEmptyTitle: {
    color: '#142b27',
    fontSize: 15,
    fontWeight: '900'
  },
  searchEmptyText: {
    color: '#61746b',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2
  },
  foodRow: {
    alignItems: 'center',
    backgroundColor: '#fffaf0',
    borderColor: '#e4dac8',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12
  },
  foodIcon: {
    alignItems: 'center',
    backgroundColor: '#e7f4e3',
    borderRadius: 16,
    height: 42,
    justifyContent: 'center',
    width: 42
  },
  foodMeta: {
    flex: 1
  },
  foodName: {
    color: '#142b27',
    fontSize: 16,
    fontWeight: '900'
  },
  foodDetail: {
    color: '#61746b',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#fffaf0',
    borderColor: '#e4dac8',
    borderRadius: 22,
    borderWidth: 1,
    padding: 22
  },
  emptyTitle: {
    color: '#142b27',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 10
  },
  emptyText: {
    color: '#61746b',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center'
  },
  logRow: {
    alignItems: 'center',
    backgroundColor: '#fffaf0',
    borderColor: '#e4dac8',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 13
  },
  logName: {
    color: '#142b27',
    fontSize: 15,
    fontWeight: '900'
  },
  logDetail: {
    color: '#61746b',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2
  },
  logRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10
  },
  logProtein: {
    color: '#0d5f4b',
    fontSize: 18,
    fontWeight: '900'
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: '#f8ded7',
    borderRadius: 99,
    height: 28,
    justifyContent: 'center',
    width: 28
  },
  shareCard: {
    aspectRatio: 9 / 16,
    borderRadius: 30,
    justifyContent: 'space-between',
    overflow: 'hidden',
    padding: 24
  },
  shareTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  shareBrand: {
    color: '#fff6df',
    fontSize: 19,
    fontWeight: '900'
  },
  shareBadge: {
    alignItems: 'center',
    backgroundColor: '#fff6df',
    borderRadius: 99,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  shareBadgeText: {
    color: '#19322c',
    fontSize: 12,
    fontWeight: '900'
  },
  shareBig: {
    color: '#fff6df',
    fontSize: 86,
    fontWeight: '900',
    lineHeight: 94
  },
  shareSub: {
    color: '#ffdf86',
    fontSize: 19,
    fontWeight: '900'
  },
  shareDivider: {
    backgroundColor: 'rgba(255,246,223,0.4)',
    height: 1
  },
  shareFood: {
    color: '#fff6df',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 31
  },
  shareFooter: {
    color: 'rgba(255,246,223,0.82)',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21
  },
  modalBackdrop: {
    backgroundColor: 'rgba(12,24,22,0.42)',
    flex: 1,
    justifyContent: 'flex-end'
  },
  sheet: {
    backgroundColor: '#f7f3ea',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 34
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: '#c9beaa',
    borderRadius: 99,
    height: 5,
    marginBottom: 16,
    width: 44
  },
  sheetTitle: {
    color: '#142b27',
    fontSize: 25,
    fontWeight: '900'
  },
  sheetSubtitle: {
    color: '#61746b',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 4
  },
  servingRow: {
    alignItems: 'center',
    backgroundColor: '#fffaf0',
    borderColor: '#e4dac8',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    padding: 14
  },
  servingLabel: {
    color: '#142b27',
    fontSize: 16,
    fontWeight: '900'
  },
  servingDetail: {
    color: '#61746b',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2
  },
  servingProtein: {
    color: '#0d5f4b',
    fontSize: 20,
    fontWeight: '900'
  },
  cancelButton: {
    alignItems: 'center',
    marginTop: 12,
    padding: 13
  },
  cancelButtonText: {
    color: '#61746b',
    fontSize: 15,
    fontWeight: '900'
  },
  input: {
    backgroundColor: '#fffaf0',
    borderColor: '#e4dac8',
    borderRadius: 16,
    borderWidth: 1,
    color: '#142b27',
    fontSize: 16,
    marginTop: 12,
    minHeight: 52,
    paddingHorizontal: 14
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#16302b',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 14,
    padding: 15
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900'
  }
});
